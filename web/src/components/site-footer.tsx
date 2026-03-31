import Link from "next/link";

const footerLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/chai-pin-zheng/",
  },
  {
    label: "GitHub",
    href: "https://github.com/Ducksss",
  },
  {
    label: "View source",
    href: "https://github.com/ducksss/beacon",
  },
  {
    label: "Try Beacon",
    href: "/try",
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/8 bg-[#080808]/96">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="flex flex-col gap-6 border-t border-white/6 pt-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-[#ffbf6b]/58">
              Built by Chai Pin Zheng
            </p>
            <p className="mt-3 text-sm leading-6 text-[#f7f2e8]/50 sm:text-[0.95rem]">
              I build product-led demos and operational tools with a focus on
              clear systems, calm interfaces, and workflows that feel ready for
              real teams.
            </p>
          </div>

          <div className="flex flex-col gap-4 text-sm text-[#f7f2e8]/42 lg:items-end">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {footerLinks.map((link) => {
                const className = "transition-colors hover:text-[#f7f2e8]/72";

                return link.href.startsWith("/") ? (
                  <Link key={link.label} href={link.href} className={className}>
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={className}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
            <p>© 2026 Beacon</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
