"use client";

import type { ComponentType } from "react";
import type { ToolWorkbenchConfig } from "@/lib/tool-registry";
import { UuidWorkbench } from "./UuidWorkbench";
import { PasswordWorkbench } from "./PasswordWorkbench";
import { MarkdownWorkbench } from "./MarkdownWorkbench";
import { QrWorkbench } from "./QrWorkbench";
import { QrDecodeWorkbench } from "./QrDecodeWorkbench";
import { KeygenWorkbench } from "./KeygenWorkbench";

export const customWorkbenches: Record<string, ComponentType<{ tool: ToolWorkbenchConfig }>> = {
  "/tools/generator/uuid": UuidWorkbench,
  "/tools/generator/password": PasswordWorkbench,
  "/tools/text/markdown": MarkdownWorkbench,
  "/tools/generator/qr": QrWorkbench,
  "/tools/qr/decode": QrDecodeWorkbench,
  "/tools/crypto/keygen": KeygenWorkbench
};
