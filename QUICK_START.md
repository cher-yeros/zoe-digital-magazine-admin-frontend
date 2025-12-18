# Zoe Digital Magazine Admin - Quick Start Guide

## Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file in the root directory:
```env
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
VITE_API_BASE_URL=http://localhost:4000
```

### 3. Generate GraphQL Types (Optional)
```bash
npm run codegen
```

### 4. Start Development Server
```bash
npm run dev
```

The admin panel will be available at `http://localhost:5173`

## Default Login Credentials
You'll need to create these in your backend first:
```
Email: admin@zoe-magazine.com
Role: administrator
```

## Quick Tour of Features

### For Administrators
1. **Dashboard** (`/admin/dashboard`)
   - Overview of all magazine metrics
   - Pending submissions
   - Top articles and contributors

2. **Articles** (`/admin/articles`)
   - View all articles
   - Create new articles
   - Edit existing articles

3. **Submissions** (`/admin/submissions`)
   - Review submitted articles
   - Approve or request changes
   - Track review progress

4. **Users** (`/admin/users`)
   - Manage all users
   - Assign roles
   - Send invitations

5. **Categories** (`/admin/categories`)
   - Create article categories
   - Organize content

6. **Issues** (`/admin/issues`)
   - Create magazine editions
   - Assign articles to issues

7. **Comments** (`/admin/comments`)
   - Moderate reader comments
   - Approve or hide spam

8. **Subscriptions** (`/admin/subscriptions`)
   - View all subscribers
   - Send newsletters

9. **Audit Logs** (`/admin/audit-logs`)
   - Track all system activities

### For Contributors
1. **My Articles** (`/admin/articles`)
   - View your articles
   - Create new content

2. **New Article** (`/admin/articles/new`)
   - Write and submit articles
   - Add media and categories

### For Editors/Reviewers
1. **Submissions** (`/admin/submissions`)
   - Review pending articles
   - Provide feedback
   - Approve for publication

## Key Workflows

### Creating an Article
1. Navigate to **Articles** → **New Article**
2. Enter title (slug auto-generates)
3. Write content using Markdown editor
4. Add excerpt and categories
5. Save as **Draft** or **Submit for Review**

### Publishing Flow
1. **Contributor** creates and submits article
2. **Reviewer** reviews and approves/rejects
3. **Editor** schedules or publishes immediately
4. Published article appears on public site

### Managing Users
1. Go to **Users** → **Add User**
2. Enter email/phone and name
3. Select role (administrator, editor, reviewer, contributor)
4. User receives invitation (if email provided)

### Sending Newsletter
1. Go to **Subscriptions**
2. Click **Send Newsletter**
3. Enter subject and select audience
4. Optionally add template ID
5. Send to all active subscribers

## Keyboard Shortcuts (Editor)

- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + K` - Insert link
- `#` + Space - Heading 1
- `##` + Space - Heading 2
- `###` + Space - Heading 3
- `-` + Space - Bullet list
- `1.` + Space - Numbered list
- `>` + Space - Quote

## Common Tasks

### How to Feature an Article
1. Go to **Articles**
2. Click **Edit** on the article
3. Toggle **Featured Article** switch
4. Save changes

### How to Schedule Publication
1. Edit the article
2. Set status to **Scheduled**
3. Choose date and time in **Schedule For**
4. Save

### How to Moderate Comments
1. Go to **Comments**
2. View **Pending Moderation** tab
3. Click ✓ to approve or ✗ to reject
4. Comments appear on public site after approval

### How to Export Subscribers
1. Go to **Subscriptions**
2. Click **Export** button
3. CSV file downloads automatically

## Troubleshooting

### "Network Error"
- Check if backend is running
- Verify `VITE_GRAPHQL_ENDPOINT` in `.env`
- Check browser console for CORS errors

### "Unauthorized"
- Token may have expired
- Log out and log in again
- Check role permissions

### "GraphQL Error"
- Backend schema may not match frontend
- Run `npm run codegen` to regenerate types
- Check backend logs for errors

### Editor Not Loading
- Clear browser cache
- Check browser console for errors
- Ensure all dependencies are installed

## Production Deployment

### Build for Production
```bash
npm run build
```

Output will be in `dist/` folder.

### Deploy to Vercel
```bash
vercel deploy
```

### Deploy to Netlify
```bash
netlify deploy --prod
```

### Environment Variables for Production
```env
VITE_GRAPHQL_ENDPOINT=https://api.yourdomain.com/graphql
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Performance Tips

1. **Images**: Compress images before upload
2. **Caching**: Enable Apollo Client cache
3. **Pagination**: Use cursor-based pagination
4. **Search**: Implement debouncing on search inputs

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure CORS policies
- [ ] Implement rate limiting
- [ ] Enable CSP headers
- [ ] Sanitize HTML content
- [ ] Use secure session storage
- [ ] Validate file uploads

## Useful Links

- [React Documentation](https://react.dev/)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [Radix UI Components](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Markdown Guide](https://www.markdownguide.org/)

## Support

For issues or questions:
1. Check `MIGRATION_SUMMARY.md` for detailed information
2. Review backend documentation in `/doc` folder
3. Check browser console for error messages
4. Verify GraphQL endpoint is accessible

## Development Tips

### Hot Reload Issues
```bash
# Clear cache and restart
rm -rf node_modules/.vite
npm run dev
```

### GraphQL Schema Updates
```bash
# Regenerate types after backend changes
npm run codegen
```

### Debugging
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Use Apollo DevTools extension

## What's Next?

1. Customize branding colors in `src/theme/brand.ts`
2. Add custom analytics tracking
3. Implement custom email templates
4. Add multi-language support
5. Integrate social media sharing
6. Add advanced search features
7. Implement comment threading
8. Add article versioning UI

---

**Happy Publishing! 📝✨**

