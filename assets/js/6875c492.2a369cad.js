"use strict";(self.webpackChunk_urturn_docs=self.webpackChunk_urturn_docs||[]).push([[610],{7477:(e,t,a)=>{a.d(t,{Z:()=>b});var l=a(7378),n=a(9703),r=a(9277),s=a(8153),o=a(922),i=a(8293),c=a(7226),g=a(1580),m=a(252),u=a(6265),p=a(2594),d=a(273);const h=(0,a(2354).Z)({palette:{mode:"dark"}}),b={React:l,...l,theme:h,board:[[null,null,null],[null,null,null],[null,null,null]],ThemeProvider:n.Z,Typography:r.Z,Stack:s.Z,Box:o.Z,List:i.Z,ListItem:c.ZP,ListItemText:g.Z,Paper:m.Z,Snackbar:u.Z,Alert:p.Z,Fade:d.Z}},13:(e,t,a)=>{a.d(t,{Z:()=>s});var l=a(7378),n=a(9213),r=a(4582);function s(e){const{metadata:t}=e,{previousPage:a,nextPage:s}=t;return l.createElement("nav",{className:"pagination-nav","aria-label":(0,n.I)({id:"theme.blog.paginator.navAriaLabel",message:"Blog list page navigation",description:"The ARIA label for the blog pagination"})},a&&l.createElement(r.Z,{permalink:a,title:l.createElement(n.Z,{id:"theme.blog.paginator.newerEntries",description:"The label used to navigate to the newer blog posts page (previous page)"},"Newer Entries")}),s&&l.createElement(r.Z,{permalink:s,title:l.createElement(n.Z,{id:"theme.blog.paginator.olderEntries",description:"The label used to navigate to the older blog posts page (next page)"},"Older Entries"),isNext:!0}))}},2134:(e,t,a)=>{a.d(t,{Z:()=>s});var l=a(7378),n=a(412),r=a(1267);function s(e){let{items:t,component:a=r.Z}=e;return l.createElement(l.Fragment,null,t.map((e=>{let{content:t}=e;return l.createElement(n.n,{key:t.metadata.permalink,content:t},l.createElement(a,null,l.createElement(t,null)))})))}},1071:(e,t,a)=>{a.r(t),a.d(t,{default:()=>Z});var l=a(7378),n=a(8944),r=a(9213),s=a(689),o=a(8831),i=a(5484),c=a(1884),g=a(8560),m=a(13),u=a(505),p=a(2134);function d(e){const t=function(){const{selectMessage:e}=(0,s.c)();return t=>e(t,(0,r.I)({id:"theme.blog.post.plurals",description:'Pluralized label for "{count} posts". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',message:"One post|{count} posts"},{count:t}))}();return(0,r.I)({id:"theme.blog.tagTitle",description:"The title of the page for a blog tag",message:'{nPosts} tagged with "{tagName}"'},{nPosts:t(e.count),tagName:e.label})}function h(e){let{tag:t}=e;const a=d(t);return l.createElement(l.Fragment,null,l.createElement(o.d,{title:a}),l.createElement(u.Z,{tag:"blog_tags_posts"}))}function b(e){let{tag:t,items:a,sidebar:n,listMetadata:s}=e;const o=d(t);return l.createElement(g.Z,{sidebar:n},l.createElement("header",{className:"margin-bottom--xl"},l.createElement("h1",null,o),l.createElement(c.Z,{href:t.allTagsPath},l.createElement(r.Z,{id:"theme.tags.tagsPageLink",description:"The label of the link targeting the tag list page"},"View All Tags"))),l.createElement(p.Z,{items:a}),l.createElement(m.Z,{metadata:s}))}function Z(e){return l.createElement(o.FG,{className:(0,n.Z)(i.k.wrapper.blogPages,i.k.page.blogTagPostListPage)},l.createElement(h,e),l.createElement(b,e))}}}]);