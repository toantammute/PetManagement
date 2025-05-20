export const COLORS = {
    appointment: {
        completed: '#388E3C',
        pending: '#F8941A',
        cancel: '#C62828',
        inprogress: '#2DCAE9',
        checkin: '#2DCAE9',     
    },

    //button color
    button: {
        default: '#b5b9c2',
        choose: '#6071E3',
        disable: '#8E8E93',
        icon: '#A2C1DA'
    },

    header: {
        text: '#4F46E5',
    },

    //text color
    text: {
        text: '#000000',
        textDisable: '#b5b9c2',
        textChoose: '#6071E3',
        status: '#FFFFFF',
        control: '#2DCAE9',
        default: '#757575',
    },

    //background color
    background: {
        white: '#FFFFFF',
        gray: '#F6F6F6',
        darkBlue: '#5780E9',
        lightBlue: '#E7F1F3',
        mint: '#52BED6',
    },

    //status color
    status: {
        success: '#388E3C',
        pending: '#F8941A',
        cancel: '#C62828',
    },

    //border color
    border: {
        avatar: '#E0E0E0',
        mintbrd: '#1BBBCB',
        input: '#D2D5DA'
    },
} as const;

export const SIZES = {
    icon: {
        small: 16,
        medium: 28,
        large: 32,
    },
    text: {
        xs: 8,
        s: 10,
        m: 12,
        l: 14,
        xl: 16,
        xxl: 18,
    },
} as const;

export type ButtonVariant = 'default' | 'disable' | 'choose';

export interface Theme {
    colors: typeof COLORS;
    sizes: typeof SIZES;
}
