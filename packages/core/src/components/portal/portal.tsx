/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the terms of the LICENSE file distributed with this project.
 */

import * as React from "react";
import * as ReactDOM from "react-dom";

import * as Classes from "../../common/classes";
import * as Errors from "../../common/errors";
import { IProps } from "../../common/props";
import { safeInvoke } from "../../common/utils";

export interface IPortalProps extends IProps, React.HTMLProps<HTMLDivElement> {
    /**
     * A React `ref` handler callback for the detached container root element.
     * As this component renders its contents into a separate container, the result of the `ref`
     * prop is not backed by a DOM node. Hence this callback is necessary to get the real DOM node.
     */
    containerRef?: (ref: HTMLDivElement) => void;

    /**
     * Callback invoked when the children of this `Portal` have been added to the DOM.
     */
    onChildrenMount?: () => void;
}

export interface IPortalContext {
    /** Additional class to add to portal element */
    blueprintPortalClassName?: string;
}

const REACT_CONTEXT_TYPES: React.ValidationMap<IPortalContext> = {
    blueprintPortalClassName: (obj: IPortalContext, key: keyof IPortalContext) => {
        if (obj[key] != null && typeof obj[key] !== "string") {
            return new Error(Errors.PORTAL_CONTEXT_CLASS_NAME_STRING);
        }
        return undefined;
    },
};

/**
 * This component detaches its contents and re-attaches them to document.body.
 * Use it when you need to circumvent DOM z-stacking (for dialogs, popovers, etc.).
 * Any class names passed to this element will be propagated to the new container element on document.body.
 */
export class Portal extends React.Component<IPortalProps, {}> {
    public static displayName = "Blueprint.Portal";
    public static contextTypes = REACT_CONTEXT_TYPES;
    public context: IPortalContext;

    private targetElement: HTMLElement;

    constructor(props: IPortalProps, context: IPortalContext) {
        super(props, context);
        this.targetElement = document.createElement("div");
        this.targetElement.classList.add(Classes.PORTAL);
        if (context.blueprintPortalClassName != null) {
            this.targetElement.classList.add(context.blueprintPortalClassName);
        }
    }

    public render() {
        return ReactDOM.createPortal(this.props.children, this.targetElement);
    }

    public componentDidMount() {
        document.body.appendChild(this.targetElement);
        safeInvoke(this.props.onChildrenMount);
    }

    public componentWillUnmount() {
        this.targetElement.remove();
    }
}
