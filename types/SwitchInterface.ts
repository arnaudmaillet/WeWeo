import { ReactElement } from "react";

export interface IButtonColor {
    default: string,         // Couleur par défaut (non sélectionnée)
    active: string           // Couleur active (sélectionnée)
}

export interface IButtonText extends IButtonChild {}

export interface IButtonIcon extends IButtonChild {
    size: number,            // Taille de l'icône
    component: ReactElement; // Composant de l'icône (exemple : <Ionicons/>)
}

export interface IButtonChild {
    label: string;           // Texte ou nom de l'icône (exemple : 'globe-outline')
    color: IButtonColor      // Couleurs associées
}

export interface IButton {
    text: IButtonText;       // Configuration du texte du bouton
    icon: IButtonIcon;       // Configuration de l'icône du bouton
    background: IButtonColor // Couleurs d'arrière-plan (non sélectionné/sélectionné)
}

export interface ISwitch {
    label?: string;          // Label optionnel pour le switch (non rendu si non fourni)
    buttons: IButton[];      // Liste des boutons du switch
}
