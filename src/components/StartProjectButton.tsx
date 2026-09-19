"use client";

import { Button } from "./Button";
import { useProjectDialog } from "./ProjectDialog";

/** "Start a project" button. It opens the project form in a dialog instead of
 *  scrolling to the contact section. `onOpen` runs first, e.g. to close the
 *  mobile menu so it is not left open behind the dialog. */
export function StartProjectButton({
  className,
  onOpen,
}: {
  className?: string;
  onOpen?: () => void;
}) {
  const { open } = useProjectDialog();
  return (
    <Button
      variant="primary"
      cascade
      className={className}
      onClick={() => {
        onOpen?.();
        open();
      }}
    >
      Start a project
    </Button>
  );
}
