interface Data {
    dataset: Dataset;
}

interface Dataset {
    status: { [key: string]: Status };
    dimension: Dimension;
    label: string;
    source: string;
    updated: Date;
    value: Array<number | null>;
}

interface Dimension {
    Grossregion: Grossregion;
    Wirtschaftssektor: Wirtschaftssektor;
    Beschäftigungsgrad: Beschäftigungsgrad;
    Geschlecht: Geschlecht;
    Quartal: Quartal;
    id: string[];
    size: number[];
    role: Role;
}

interface Beschäftigungsgrad {
    label: string;
    category: BeschäftigungsgradCategory;
    extension: Extension;
}

interface BeschäftigungsgradCategory {
    index: PurpleIndex;
    label: PurpleLabel;
}

interface PurpleIndex {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    TOT: number;
    "4.1": number;
}

interface PurpleLabel {
    "1": string;
    "2": string;
    "3": string;
    "4": string;
    TOT: string;
    "4.1": string;
}

interface Extension {
    show: string;
}

interface Geschlecht {
    label: string;
    category: GeschlechtCategory;
    extension: Extension;
}

interface GeschlechtCategory {
    index: FluffyIndex;
    label: FluffyLabel;
}

interface FluffyIndex {
    "1": number;
    "2": number;
    TOT: number;
}

interface FluffyLabel {
    "1": string;
    "2": string;
    TOT: string;
}

interface Grossregion {
    label: string;
    category: GrossregionCategory;
    extension: Extension;
}

interface GrossregionCategory {
    index: { [key: string]: number };
    label: { [key: string]: string };
}

interface Quartal {
    label: string;
    category: QuartalCategory;
    extension: Extension;
}

interface QuartalCategory {
    index: { [key: string]: number };
    label: TentacledLabel;
}

interface TentacledLabel {
    "2020Q1": string;
    "2020Q2": string;
    "2020Q3": string;
    "2020Q4": string;
    "2021Q1": string;
    "2021Q2": string;
    "2021Q3": string;
    "2021Q4": string;
    "2022Q1": string;
    "2022Q2": string;
    "2022Q3": string;
    "2022Q4": string;
    "2023Q1": string;
    "2023Q2": string;
    "2023Q3": string;
    "2023Q4": string;
    "2024Q1": string;
    "2024Q2": string;
}

interface Wirtschaftssektor {
    label: string;
    category: WirtschaftssektorCategory;
    extension: Extension;
}

interface WirtschaftssektorCategory {
    index: TentacledIndex;
    label: StickyLabel;
}

interface TentacledIndex {
    "2": number;
    "3": number;
    TOT: number;
}

interface StickyLabel {
    "2": string;
    "3": string;
    TOT: string;
}

interface Role {
    time: string[];
}

enum Status {
    Empty = "...",
}
