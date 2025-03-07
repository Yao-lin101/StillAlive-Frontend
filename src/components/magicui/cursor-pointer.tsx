import React from 'react';
import { Pointer } from "./pointer";

interface CursorPointerProps {
  className?: string;
  children?: React.ReactNode;
}

export const CursorPointer: React.FC<CursorPointerProps> = ({ className, children }) => {
  return (
    <div className="cursor-none [&_*]:cursor-none">
      <Pointer className={className} />
      {children}
    </div>
  );
}; 