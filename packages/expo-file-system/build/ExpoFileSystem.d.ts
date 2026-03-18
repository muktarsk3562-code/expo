import { NativeModule, SharedObject } from 'expo-modules-core';
import type { Directory, File, DownloadOptions, PathInfo, UploadProgress, DownloadProgress, UploadResult } from './ExpoFileSystem.types';
type UploadTaskEvents = {
    progress: (data: UploadProgress) => void;
};
type DownloadTaskEvents = {
    progress: (data: DownloadProgress) => void;
};
declare class FileSystemUploadTask extends SharedObject<UploadTaskEvents> {
    start(url: string, file: File, options: Record<string, any>): Promise<UploadResult>;
    cancel(): void;
}
declare class FileSystemDownloadTask extends SharedObject<DownloadTaskEvents> {
    start(url: string, to: File | Directory, options?: Record<string, any>): Promise<string | null>;
    pause(): {
        resumeData: string;
    };
    resume(url: string, to: File | Directory, resumeData: string, options?: Record<string, any>): Promise<string | null>;
    cancel(): void;
}
declare class ExpoFileSystemModule extends NativeModule {
    FileSystemDirectory: typeof Directory;
    FileSystemFile: typeof File;
    FileSystemUploadTask: typeof FileSystemUploadTask;
    FileSystemDownloadTask: typeof FileSystemDownloadTask;
    downloadFileAsync(url: string, destination: File | Directory, options?: DownloadOptions): Promise<string>;
    pickDirectoryAsync(initialUri?: string): Promise<Directory>;
    pickFileAsync(initialUri?: string, mimeType?: string): Promise<File>;
    info(uri: string): PathInfo;
    totalDiskSpace: number;
    availableDiskSpace: number;
    documentDirectory: string;
    cacheDirectory: string;
    bundleDirectory: string;
    appleSharedContainers?: Record<string, string>;
}
declare const _default: ExpoFileSystemModule;
export default _default;
//# sourceMappingURL=ExpoFileSystem.d.ts.map