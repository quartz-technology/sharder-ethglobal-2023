import React, { createContext, useContext, useState, ReactNode } from "react";

export interface SplitSecretState {
    file?: File;
    shardNumber: number;
    threshold: number;
    fileList: File[];
}

export interface CombineShardsState {
    fileList: File[];
    file?: File;
}

interface AppState {
    splitSecret: SplitSecretState;
    setSplitSecret: React.Dispatch<React.SetStateAction<SplitSecretState>>;
    combineShards: CombineShardsState;
    setCombineShards: React.Dispatch<React.SetStateAction<CombineShardsState>>;
}

const initialState: AppState = {
    splitSecret: {shardNumber: 2, threshold: 2, fileList: []},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setSplitSecret: () => {},
    combineShards: {fileList: []},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setCombineShards: () => {},
};

export const SharderContext = createContext<AppState>(initialState);

export const SharderContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [splitSecret, setSplitSecret] = useState<SplitSecretState>({shardNumber: 2, threshold: 2, fileList: []});
    const [combineShards, setCombineShards] = useState<CombineShardsState>({fileList: []});

    return (
        <SharderContext.Provider value={{ splitSecret, setSplitSecret, combineShards, setCombineShards }}>
            {children}
        </SharderContext.Provider>
    );
};

export const useSharderContext = () => useContext(SharderContext);

