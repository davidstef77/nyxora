# Unificare Autorizare Admin

## Rezumat

Am unificat sistemul de autorizare admin pentru întreaga aplicație, centralizând logica în `src/lib/auth.js`.

## Schimbări Implementate

### 1. Creat Utilitar Centralizat de Autorizare

**Fișier nou:** `src/lib/auth.js`

Funcția `isAuthorized(request)` verifică autorizarea prin două metode:
- **Sesiune admin**: Utilizator autentificat cu `role === 'admin'`
- **Header API key**: Request cu header `x-admin-key` valid

### 2. Actualizat Toate Rutele API

Următoarele rute API au fost actualizate pentru a folosi funcția centralizată:

#### Blogs
- `src/app/api/blogs/route.js`
- `src/app/api/blogs/[slug]/route.js`

#### Tops
- `src/app/api/tops/route.js`
- `src/app/api/tops/[slug]/route.js`

#### Products
- `src/app/api/products/route.js`
- `src/app/api/products/[slug]/route.js`

#### Categories
- `src/app/api/categories/route.js`
- `src/app/api/categories/[slug]/route.js`

#### Other
- `src/app/api/seed/route.js`

### 3. Îmbunătățiri

#### Înainte (Pattern Inconsistent)
```javascript
// Unele fișiere foloseau:
async function isAuthorized(request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role === 'admin') return true;
  const envKey = cleanKey(process.env.ADMIN_KEY);
  if (envKey) {
    const headerKey = cleanKey(request.headers.get('x-admin-key'));
    return headerKey && headerKey === envKey;
  }
  return false;
}

// Alte fișiere foloseau:
const adminKey = request.headers.get('x-admin-key');
if (process.env.ADMIN_KEY && process.env.ADMIN_KEY !== adminKey) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}

// Sau:
const headerKey = sanitizeKey(request.headers.get('x-admin-key'));
const queryKey = sanitizeKey(url.searchParams.get('adminKey'));
const providedKey = headerKey || queryKey;
const envKey = sanitizeKey(process.env.ADMIN_KEY);
if (envKey && envKey !== providedKey) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}
```

#### Acum (Pattern Unificat)
```javascript
import { isAuthorized } from '../../../lib/auth';

export async function POST(request) {
  if (!(await isAuthorized(request))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  // ... rest of implementation
}
```

## Beneficii

1. **Cod DRY**: Eliminat codul duplicat din 10+ fișiere
2. **Consistență**: Toate rutele folosesc aceeași logică de autorizare
3. **Mentenabilitate**: Schimbările în logica de autorizare se fac într-un singur loc
4. **Securitate**: Pattern unificat și testat pentru toate endpoint-urile
5. **Flexibilitate**: Suportă atât autentificare bazată pe sesiune cât și pe API key

## Metode de Autorizare Suportate

### 1. Autentificare Admin prin Sesiune
- Login prin `/admin/login` cu parola admin
- NextAuth creează sesiune cu `role: 'admin'`
- Sesiunea este validată automat la fiecare request

### 2. Autentificare prin API Key
- Header: `x-admin-key: <ADMIN_KEY>`
- Util pentru scripturi și tooling extern
- Configurabil prin variabila de mediu `ADMIN_KEY`

## Verificare

✅ Nu sunt erori de compilare  
✅ Toate rutele API folosesc `isAuthorized()` importat din `src/lib/auth.js`  
✅ Pattern consistent în toate fișierele  

## Fișiere Modificate

- ✅ `src/lib/auth.js` (NOU)
- ✅ `src/app/api/blogs/route.js`
- ✅ `src/app/api/blogs/[slug]/route.js`
- ✅ `src/app/api/tops/route.js`
- ✅ `src/app/api/tops/[slug]/route.js`
- ✅ `src/app/api/products/route.js`
- ✅ `src/app/api/products/[slug]/route.js`
- ✅ `src/app/api/categories/route.js`
- ✅ `src/app/api/categories/[slug]/route.js`
- ✅ `src/app/api/seed/route.js`

## Testare

Pentru a testa autorizarea:

1. **Test cu sesiune admin:**
   ```
   - Navigate to /admin/login
   - Enter admin password
   - Try creating/updating content via admin panel
   ```

2. **Test cu API key:**
   ```bash
   curl -X POST http://localhost:3000/api/products \
     -H "x-admin-key: YOUR_ADMIN_KEY" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Product",...}'
   ```

3. **Test fără autorizare:**
   ```bash
   curl -X POST http://localhost:3000/api/products \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Product",...}'
   # Should return 401 Unauthorized
   ```
