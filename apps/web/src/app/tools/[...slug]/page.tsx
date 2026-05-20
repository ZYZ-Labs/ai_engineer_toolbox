import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPageClient } from "./ToolPageClient";
import { findToolByPath, getToolStaticParams } from "@/lib/tool-registry";

type Props = {
  params: Promise<{
    slug: string[];
  }>;
};

export function generateStaticParams() {
  return getToolStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = findToolByPath(`/tools/${slug.join("/")}`);
  return {
    title: tool?.title || "Tool"
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = findToolByPath(`/tools/${slug.join("/")}`);

  if (!tool) {
    notFound();
  }

  return <ToolPageClient toolPath={tool.path} />;
}
