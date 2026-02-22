export default function Button({ variant = 'primary', href, children, className = '', ...props }) {
  const cls = `btn-${variant}${className ? ` ${className}` : ''}`;
  if (href) {
    return <a href={href} className={cls} {...props}>{children}</a>;
  }
  return <button className={cls} {...props}>{children}</button>;
}
