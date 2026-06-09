import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-900">
                <span className="text-white text-[10px] font-bold">M</span>
              </div>
              <span className="font-bold text-sm text-gray-900">MCPHub</span>
            </div>
            <p className="mt-2 text-sm text-gray-400 max-w-xs">
              The open marketplace for the Model Context Protocol ecosystem.
            </p>
          </div>
          <div className="flex gap-8 text-sm">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wider">Product</h4>
              <Link href="/browse" className="block text-gray-500 hover:text-gray-900 transition">Browse</Link>
              <Link href="/submit" className="block text-gray-500 hover:text-gray-900 transition">Submit</Link>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wider">Resources</h4>
              <a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer" className="block text-gray-500 hover:text-gray-900 transition">MCP Spec</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="block text-gray-500 hover:text-gray-900 transition">GitHub</a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-gray-100 text-xs text-gray-400">
          © {new Date().getFullYear()} MCPHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
