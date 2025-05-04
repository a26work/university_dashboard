/** @odoo-module **/

import { Component } from "@odoo/owl";

export class KPICard extends Component {
    static template = "university.KPICard";
    static props = {
        title: String,
        count: Number,
        icon: String,
        onClick: { type: Function, optional: true },
    };

    onClick() {
        if (this.props.onClick) {
            this.props.onClick({
                title: this.props.title,
                count: this.props.count
            });
        }
    }
}