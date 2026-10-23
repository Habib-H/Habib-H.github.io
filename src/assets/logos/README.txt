Put your logo files in this folder (SVG preferred; PNG/WebP also work).

They are matched to the tools by file name. Case, spaces, dashes, underscores and words like
"logo" / "icon" are ignored, so "Power-BI_logo.svg" and "powerbi.svg" both match Power BI.
Accepted names (any one of them):

  Oracle          oracle
  SQL Server      sqlserver, microsoftsqlserver, mssql      (logo + the text "SQL Server")
  PostgreSQL      postgresql, postgres
  Dataiku DSS     dataiku, dss
  Talend          talend
  Power BI        powerbi, pbi
  Qlik Sense      qliksense, qlik
  Python          python
  PL-SQL          plsql                                       (logo + the text "PL-SQL")
  R               r, rlang, rproject
  SAS             sas
  HTML            html, html5
  CSS             css, css3
  Javascript      javascript, js
  Django          django
  Vue             vue, vuejs
  JWT             jwt, jsonwebtoken

SQL, DAX and M have no logo: they stay as text.
A tool without a file simply shows its name until you add the file.

NOTE - your original files are kept untouched in src/assets/logos-original/.
For 7 logos drawn small inside a lot of empty space (dataiku, power_bi, python, postgresql,
html5, plsql, sql_server) the copy in this folder only has its viewBox tightened to the drawing,
so they appear at the same visual size as the others. Nothing else in them was changed.
