import { useRevalidator } from "react-router";

import {
  getLocale,
  locales,
  setLocale,
  type Locale,
} from "../../paraglide/runtime";
import { cn } from "./utils/cn";

export function LocaleSwitcher() {
  const currentLocale = getLocale();
  const revalidator = useRevalidator();

  const handleLocaleChange = (locale: Locale) => {
    setLocale(locale, { reload: false });
    revalidator.revalidate();
  };

  return (
    <div
      className={cn(
        "flex items-center rounded-lg border border-gray-700 bg-gray-800/50 p-0.5",
        "backdrop-blur-sm"
      )}
      role="group"
      aria-label="Language selector"
    >
      {locales.map((locale, index) => {
        const isActive = currentLocale === locale;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => handleLocaleChange(locale)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900",
              isActive
                ? "bg-gray-50 text-gray-900 shadow-sm"
                : "text-gray-300 hover:text-gray-50 hover:bg-gray-700/50",
              index === 0 && "rounded-r-none",
              index === locales.length - 1 && "rounded-l-none"
            )}
            aria-pressed={isActive}
          >
            {locale.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
