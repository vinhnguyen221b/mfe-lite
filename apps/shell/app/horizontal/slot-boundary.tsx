"use client";

import { Component, type ReactNode } from "react";

export class SlotBoundary extends Component<{ label: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="card" data-slot-failed={this.props.label}>
          {this.props.label} is unavailable right now. The rest of this page is unaffected.
        </div>
      );
    }
    return this.props.children;
  }
}
