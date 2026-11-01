import { useSiteContent } from "../../context/SiteContentContext";
import { SafeLink } from "./SafeLink";

interface CvDownloadButtonProps {
  className: string;
}

export function CvDownloadButton({ className }: CvDownloadButtonProps) {
  const { cvUrl } = useSiteContent();

  if (cvUrl.data) {
    return (
      <SafeLink url={cvUrl.data} download className={className}>
        Download CV
      </SafeLink>
    );
  }

  return (
    <span className={className} aria-disabled="true" title="The CV has not been uploaded yet">
      Download CV
    </span>
  );
}
