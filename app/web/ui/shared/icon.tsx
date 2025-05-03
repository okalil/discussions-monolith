import React from "react";

type Props = React.SVGProps<SVGSVGElement> & {
  name: string;
  size?: number;
  loading?: "eager" | "lazy";
};

export function Icon({ name, size = 16, loading, ...props }: Props) {
  const [inView, setInView] = React.useState(loading === "lazy" ? false : true);
  return (
    <svg
      ref={(svg) => {
        if (svg && !inView) {
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) setInView(true);
            },
            { rootMargin: size + "px" }
          );
          observer.observe(svg);
          return () => observer.unobserve(svg);
        }
      }}
      width={size}
      height={size}
      {...props}
    >
      {inView && <use href={`/icons/${name}.svg#icon`} />}
    </svg>
  );
}
