## 📋 Comprehensive Vulnerability Map (All 20 Implemented)

| **#**  | **Vulnerability Category**           | **Location / Path**                   | **Exploitation Trigger / Description**                                                     |
| ------ | ------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------ |
| **1**  | **SQL Injection (Auth Bypass)**      | `POST /api/login`                     | Inject `' OR '1'='1` in the email parameter to bypass authentication.                      |
| **2**  | **Server-Side Template Injection**   | `POST /api/preview-card`              | Render Jinja syntax like `{{ config }}` or `{{ self.__init__.__globals__ }}`.              |
| **3**  | **Command Injection (RCE)**          | `POST /api/admin/generate-label`      | Append `; cat /flag.txt` inside `tracking_id`.                                             |
| **4**  | **Insecure Direct Object Reference** | `GET /api/account/receipt?order_id=X` | Iterate numeric order IDs to read private user purchase records.                           |
| **5**  | **Server-Side Request Forgery**      | `POST /api/fetch-design`              | Supply internal target URLs like `http://database:3306`.                                   |
| **6**  | **Race Condition**                   | `POST /api/redeem-coupon`             | Send concurrent HTTP requests with code `LUXURY50` to stack balance multiples.             |
| **7**  | **Business Logic Flaw**              | `POST /api/checkout`                  | Submit negative quantities (`quantity: -5`) to reduce order cost to $\le 0$.               |
| **8**  | **Insecure Deserialization**         | `POST /api/import-cart`               | Submit base64-encoded Python `pickle` payloads to achieve code execution.                  |
| **9**  | **JWT Authentication Bypass**        | `GET /api/admin/dashboard`            | Forge tokens with `"alg": "none"` or sign using weak secret `"secret"`.                    |
| **10** | **Information Disclosure**           | `GET /api/debug-env`                  | Dump system environment variables and secret server configuration.                         |
| **11** | **Unrestricted File Upload**         | `POST /legacy/upload_item.php`        | Upload `.php` web shell scripts directly into `/uploads/`.                                 |
| **12** | **Local File Inclusion (LFI)**       | `GET /legacy/download_invoice.php`    | Traverse directory path using `?file=../../../../etc/passwd` or `/var/www/flag.txt`.       |
| **13** | **CORS Misconfiguration**            | Nginx header `*`                      | Wildcard domain policies allow cross-origin credential stealing.                           |
| **14** | **Nginx Path Traversal**             | `/staticfiles../`                     | Missing trailing slash in Nginx `alias` Directive allows directory listing traversal.      |
| **15** | **Hardcoded API Tokens**             | `frontend/src/App.jsx`                | Front-end source code contains embedded API tokens (`HARDCODED_DEV_SECRET`).               |
| **16** | **Sensitive Key in Memory**          | React State                           | Exposed global state variables contain active developer key strings.                       |
| **17** | **DOM-Based XSS**                    | `App.jsx` Gift Card                   | Render HTML via `dangerouslySetInnerHTML` accepting `<script>` injection.                  |
| **18** | **Unvalidated Open Redirect**        | `App.jsx` Partner Jump                | Supply arbitrary protocol handlers or malicious external URLs into `window.location.href`. |
| **19** | **Source Code Comment Leak**         | HTML Source                           | HTML source code exposes path secrets and hidden backup file locations.                    |
| **20** | **Missing Rate Limiting**            | `/api/login` & `/api/checkout`        | Endpoints allow brute-force credential stuffing without lockout limits.                    |