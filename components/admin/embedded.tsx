"use client";

import { createContext, useContext } from "react";

const EmbeddedContext = createContext(false);

export const EmbeddedProvider = EmbeddedContext.Provider;

export const useEmbedded = () => useContext(EmbeddedContext);
