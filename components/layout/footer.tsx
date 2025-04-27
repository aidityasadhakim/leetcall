export const Footer = () => {
  return (
    <footer className="border-t">
      <div className="container py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} LeetCall. All rights reserved.
      </div>
    </footer>
  );
};
