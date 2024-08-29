/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2017 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardTitle } from "@patternfly/react-core/dist/esm/components/Card/index.js";

import cockpit from "cockpit";
import {
    CodeBlock,
    CodeBlockCode,
    List,
    ListItem,
    ListVariant,
    Spinner, ToggleGroup, ToggleGroupItem
} from "@patternfly/react-core";
import { EmptyStatePanel } from "cockpit-components-empty-state";

const _ = cockpit.gettext;

export const Application = () => {
    const [type, setType] = useState("user" as "user" | "system");

    return (
        <div className="pf-v5-c-page__main-section">
            <ToggleGroup aria-label="Select startup type">
                <ToggleGroupItem
                    text="System startup"
                    buttonId="toggle-group-single-1"
                    isSelected={type === "system"}
                    onChange={() => setType("system")}
                />
                <ToggleGroupItem
                    text="User startup"
                    buttonId="toggle-group-single-2"
                    isSelected={type === "user"}
                    onChange={() => setType("user")}
                />
            </ToggleGroup>
            <Plot type={type} />
        </div>
    );
};

function Plot({ type }: { type: "user" | "system" }) {
    const [svg, setSvg] = useState(undefined as unknown as HTMLElement | null);
    const [text, setText] = useState([] as string[]);

    useEffect(() => {
        const cmd = (type === "user") ? ["systemd-analyze", "--user", "plot"] : ["systemd-analyze", "plot"];
        cockpit.spawn(cmd)
                .then(svg_xml => {
                    try {
                        const doc = new DOMParser().parseFromString(svg_xml, "text/xml");

                        const topLevelText = doc.querySelectorAll("*:not(g) > text");
                        const topLevelTextContent: string[] = Array.from(topLevelText).map(e => {
                            const content: string = e.textContent ?? "";
                            e.remove();
                            return content;
                        });
                        setText(topLevelTextContent);

                        const svgElem = doc.querySelector("svg");
                        if (svgElem != null) {
                            svgElem.style.scale = "0.5";
                            const groups = doc.querySelectorAll("g");
                            const plot = groups[0];
                            const legend = groups[1];
                            console.log(legend);
                            legend.remove();
                            const textElements = [...Array.from(plot.querySelectorAll("text.left")), ...Array.from(plot.querySelectorAll("text.right"))];
                            textElements.forEach((text) => {
                                // Sets up attributes to make it possible jump to the page of a specific service
                                const match = text.innerHTML.match(/^(?<service>.+\.[a-z._-]+)(\s+\((?<time>\d+(\.\d+)?)(?<time_unit>\w+)\))?$/);
                                // Regex example: "initrd-parse-etc.service (52ms)" -> service: "initrd-parse-etc.service", time: "52", time_unit: "ms"
                                if (match !== null) {
                                    text.setAttribute("data-service", match?.groups?.service ?? "");
                                    text.setAttribute("data-time", match?.groups?.time ?? "");
                                    text.setAttribute("data-time-unit", match?.groups?.time_unit ?? "");
                                    text.classList.add("clickable-service");
                                }
                            });
                            setSvg(doc.documentElement);
                        }
                    } catch {
                        setSvg(null);
                        setText([_("There was an error parsing the output of systemd-analyze")]);
                    }
                })
                .catch(() => {
                    setSvg(null);
                    setText([_("There was an error reading the output of systemd-analyze")]);
                });
    }, [type]);

    const plotClicked: React.MouseEventHandler<HTMLDivElement> = (event) => {
        // The following code is safe because the event target is a div element, but TS doesn't know that
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const service = event.target.getAttribute("data-service");
        if (service !== null) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            cockpit.jump(`/system/services#/${service}`, cockpit.transport.host);
        }
    };

    if (svg === undefined) {
        const paragraph = (
            <Spinner size="xl" />
        );
        return (
            <div className="pf-v5-c-page__main-section">
                <EmptyStatePanel title={_("Loading")} headingLevel="h4" paragraph={paragraph} />
            </div>
        );
    } else if (svg === null) {
        const paragraph = (
            <>
                {_("systemd-analyze failed to load boot info and returned the following error:")}
            </>
        );
        const secondary = (
            <CodeBlock>
                <CodeBlockCode id="code-content">{text?.toString()}</CodeBlockCode>
            </CodeBlock>
        );
        return (
            <div className="pf-v5-c-page__main-section">
                <EmptyStatePanel title={_("Failure")} headingLevel="h4" paragraph={paragraph} secondary={secondary} />
            </div>
        );
    } else {
        return (
            <Card>
                <CardTitle>{_("Boot Info")}</CardTitle>
                <CardBody>
                    <>
                        {text.map(t => {
                            return <p key={t}>{t}</p>;
                        })}
                    </>
                    <List className="legend" isPlain variant={ListVariant.inline}>
                        <ListItem>
                            <div className="legendColor activating" />
                            {_("Activating")}
                        </ListItem>
                        <ListItem>
                            <div className="legendColor active" />
                            {_("Active")}
                        </ListItem>
                        <ListItem>
                            <div className="legendColor deactivating" />
                            {_("Deactivating")}
                        </ListItem>
                        <ListItem>
                            <div className="legendColor security" />
                            {_("Setting up security module")}
                        </ListItem>
                        <ListItem>
                            <div className="legendColor generators" />
                            {_("Generators")}
                        </ListItem>
                        <ListItem>
                            <div className="legendColor unitsload" />
                            {_("Loading unit files")}
                        </ListItem>
                    </List>
                    <div className="chart-container">
                        <div className="chart" role="presentation" onClick={plotClicked} onKeyDown={() => null} dangerouslySetInnerHTML={{ __html: svg.outerHTML }} />
                    </div>
                </CardBody>
            </Card>
        );
    }
};
