import { SafeLink } from "../ui/SafeLink";
import { formatMonthYear } from "../../lib/dates";
import type { CertificationRow } from "../../types/cms";

export function CertificationEntry({ item }: { item: CertificationRow }) {
  const issued = formatMonthYear(item.issue_date);
  const details = [item.issuer, issued].filter(Boolean).join(" · ");
  const showCredentialLink = !item.credential_url_needs_verification;

  return (
    <li className="cert">
      <h4 className="cert__name">{item.name}</h4>
      {details && <p className="entry__muted">{details}</p>}
      {item.credential_id && <p className="mono-label entry__muted">Credential ID: {item.credential_id}</p>}
      {item.description && <p className="entry__text">{item.description}</p>}
      <div className="entry__links">
        {showCredentialLink && (
          <SafeLink url={item.credential_url} className="text-link">
            View credential
          </SafeLink>
        )}
        <SafeLink url={item.certificate_file_url} className="text-link">
          View certificate
        </SafeLink>
      </div>
    </li>
  );
}
