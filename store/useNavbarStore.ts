import { create } from 'zustand';
import { THEME } from '~/constants/constants';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { createElement } from 'react';
import { ITab, TabType } from '../types/navbarTypes';


const defaultButtons: ITab[] = [
    {
        label: 'Subs',
        type: TabType.SUBSCRIPTIONS,
        isLoading: false,
        color: 'gray',
        activeColor: THEME.colors.primary,
        icon: createElement(MaterialIcons, { name: "bookmark-outline", size: 28 }),
    },
    {
        label: 'Friends',
        type: TabType.FRIENDS,
        isLoading: false,
        color: 'gray',
        activeColor: THEME.colors.primary,
        icon: createElement(MaterialIcons, { name: "group", size: 28 }),
    },
    {
        label: 'Discover',
        type: TabType.DISCOVER,
        isLoading: false,
        color: 'gray',
        activeColor: THEME.colors.primary,
        icon: createElement(Ionicons, { name: "compass-outline", size: 28 }),
    },
    {
        label: 'History',
        type: TabType.HISTORY,
        isLoading: false,
        color: 'gray',
        activeColor: THEME.colors.primary,
        icon: createElement(MaterialIcons, { name: "history", size: 28 }),
    },
    {
        label: 'Search',
        type: TabType.SEARCH,
        isLoading: false,
        color: 'gray',
        activeColor: THEME.colors.primary,
        icon: createElement(MaterialIcons, { name: "search", size: 28 }),
    },
]

interface INavbarState {
    tabs: ITab[];
    active: TabType;
    isOpen: boolean;
    setTabs: (tabs: ITab[]) => void;
    setLoading: (tabType: TabType, isLoading: boolean) => void;
    setOpen: (isOpen: boolean) => void;
    setActive: (tabType: TabType) => void;
}

const useNavbarStore = create<INavbarState>((set) => ({
    tabs: defaultButtons,
    active: TabType.DISCOVER,
    isOpen: false,
    setTabs: (tabs: ITab[]) =>
        set(() => ({
            tabs,
        })),
    setLoading: (tabType: TabType, isLoading: boolean) =>
        set((state) => ({
            tabs: state.tabs.map((tab: ITab) =>
                tab.type === tabType
                    ? { ...tab, isLoading }
                    : tab
            ),
        })),
    setOpen: (isOpen: boolean) =>
        set(() => ({
            isOpen,
        })),
    setActive: (tab: TabType) =>
        set(() => ({
            active: tab,
        })),
}));

export { useNavbarStore };







