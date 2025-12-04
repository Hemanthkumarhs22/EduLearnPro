interface IconProps {
  name: string;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  const classes = ["material-symbols-outlined", "align-middle", className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} aria-hidden="true">
      {name}
    </span>
  );
}

// Alias for clearer semantics when using Google Material Symbols
export function GoogleIcon(props: IconProps) {
  return <Icon {...props} />;
}


