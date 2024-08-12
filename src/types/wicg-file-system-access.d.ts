declare interface FilePickerOptions {
    types?: Array<{
        description: string;
        accept: { [mimeType: string]: string[] };
    }>;
    excludeAcceptAllOption?: boolean;
    multiple?: boolean;
}

declare interface FilePickerReturnType {
    getFile: () => Promise<File>;
}

declare function showOpenFilePicker(options?: FilePickerOptions): Promise<FilePickerReturnType[]>;
