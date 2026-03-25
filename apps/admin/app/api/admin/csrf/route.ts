import { issueAdminCsrfToken } from '../../../../lib/csrf';
import { apiOk } from '../../../../lib/api-response';

export async function GET() {
  const token = await issueAdminCsrfToken();
  return apiOk({ token });
}
