import { ReactElement } from "react";

interface IButton {
    label: string;       // label of the button
    class: ReactElement; // class of the icon (e.g. <Ionicons/>)
    name: string;        // name of the icon (e.g. 'globe-outline')
    color: string;       // overall main color
    size: number;        // size of the icon
}

export interface ISwitch{
    label?: string;      // if label is not provided, label container will not be rendered
    buttons: IButton[];
}