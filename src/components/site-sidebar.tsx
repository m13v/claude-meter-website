import { walkPages } from "@m13v/seo-components/server";
import { SitemapSidebarWrapper } from "./site-sidebar-client";

export function SiteSidebar() {
  const pages = walkPages({
    excludePaths: ["api"],
  });

  return <SitemapSidebarWrapper pages={pages} />;
}
