import { IonContent } from "@ionic/react";

import React from "react";

export const MaxWidthContainer: React.FC<
  React.HTMLAttributes<HTMLDivElement>
> = ({ className = "", children, ...props }) => {
  return (
    <div className={`mx-auto w-full max-w-2xl ${className}`} {...props}>
      {children}
    </div>
  );
};

export default function AppContent({
  children,
  fullscreen = false,
  className,
  ...rest
}: React.ComponentProps<typeof IonContent>) {
  return (
    <IonContent fullscreen={fullscreen} {...rest}>
      <MaxWidthContainer className={className}>{children}</MaxWidthContainer>
    </IonContent>
  );
}
