import { cn } from "@/lib/utils";

export interface LoaderProps {
  className?: string;
}

const Loader = ({ className }: LoaderProps) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900",
        className
      )}
    ></div>
  );
};

export default Loader;
