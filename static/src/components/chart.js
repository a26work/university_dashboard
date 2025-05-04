/** @odoo-module **/

import { Component, onMounted, useRef, onWillUnmount, useEffect } from "@odoo/owl";
import { loadJS } from "@web/core/assets";

export class ChartComponent extends Component {
    static template = "university.Chart";
    static props = {
        chartData: {
            type: Object,
            shape: {
                labels: Array,
                datasets: Array
            }
        },
        chartType: {
            type: String,
            optional: true,
            validate: t => ['bar', 'line', 'doughnut', 'pie', 'radar'].includes(t)
        },
        onClick: { type: Function, optional: true },
        chartOptions: { type: Object, optional: true },
        height: { type: Number, optional: true }
    };

    static defaultProps = {
        chartType: 'doughnut',
        height: 400
    };

    setup() {
        this.chartRef = useRef("chart");
        this.chartInstance = null;
        this.chartJSLoaded = false;

        onMounted(async () => {
            await this.ensureChartJSLoaded();
            this.chartJSLoaded = true;
            if (this.props.chartData) {
                this.renderChart();
            }
        });

        onWillUnmount(() => this.destroyChart());

        useEffect(
            () => {
                // Only try to render if chartJS is loaded and we have data
                if (this.chartJSLoaded && this.props.chartData) {
                    this.renderChart();
                }
            },
            () => [JSON.stringify(this.props.chartData)]
        );
    }

    async ensureChartJSLoaded() {
        if (typeof Chart === "undefined") {
            try {
                await loadJS("/web/static/lib/Chart/Chart.js");
            } catch (error) {
                console.error("Failed to load Chart.js:", error);
                throw error;
            }
        }
    }

    renderChart() {
        if (!this.chartRef.el || !this.props.chartData) return;

        const ctx = this.chartRef.el.getContext('2d');
        if (!ctx) return;

        const mergedOptions = this.getMergedChartOptions();

        this.destroyChart(); // Clean up previous instance

        try {
            this.chartInstance = new Chart(ctx, {
                type: this.props.chartType,
                data: this.props.chartData,
                options: mergedOptions
            });
        } catch (error) {
            console.error("Failed to create chart:", error);
        }
    }

    getMergedChartOptions() {
        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0 && this.props.onClick) {
                    const clickedElement = elements[0];
                    const payload = {
                        index: clickedElement.index,
                        label: this.props.chartData.labels[clickedElement.index],
                        value: this.props.chartData.datasets[0].data[clickedElement.index],
                        datasetIndex: clickedElement.datasetIndex,
                    };
                    this.props.onClick(payload);
                }
            }
        };

        return { ...defaultOptions, ...this.props.chartOptions };
    }

    destroyChart() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
    }
}