<?xml version="1.0" encoding="utf-8"?>
<!-- Created by Leo: http://leoeditor.com/leo_toc.html -->
<leo_file xmlns:leo="http://leoeditor.com/namespaces/leo-python-editor/1.1" >
<leo_header file_format="2" tnodes="0" max_tnode_index="0" clone_windows="0"/>
<globals body_outline_ratio="0.5" body_secondary_ratio="0.5">
	<global_window_position top="50" left="50" height="500" width="700"/>
	<global_log_window_position top="0" left="0" height="0" width="0"/>
</globals>
<preferences/>
<find_panel_settings/>
<vnodes>
<v t="leo.20181204193631.1"><vh>@settings</vh>
<v t="leo.20181204193631.2"><vh>@data qt-gui-plugin-style-sheet</vh></v>
<v t="leo.20181204193631.3"><vh>@string initial_split_orientation = horizontal</vh></v>
</v>
<v t="leo.20181204195026.1"><vh>@button gen_pdf</vh></v>
<v t="leo.20181204195648.1"><vh>@edit chapters.py</vh></v>
<v t="leo.20181204194033.1" a="E"><vh>@path ./../</vh>
<v t="leo.20181204194048.1"><vh>@edit README.md</vh></v>
<v t="leo.20181204201447.1"><vh>@edit .gitignore</vh></v>
<v t="leo.20181204194651.1" a="E"><vh>@path markdown</vh>
<v t="leo.20181204194700.1"><vh>@edit ieee.csl</vh></v>
<v t="leo.20181204194732.1"><vh>@edit refer.bib</vh></v>
<v t="leo.20181204194920.1"><vh>@edit template_en.tex</vh></v>
<v t="leo.20181204194943.1"><vh>@edit template_zh.tex</vh></v>
</v>
<v t="leo.20181204193804.1" a="E"><vh>@path markdown</vh>
<v t="leo.20181204193605.2"><vh>@edit cover_and_abstract.md</vh></v>
<v t="leo.20181204194856.1"><vh>@edit reference.md</vh></v>
<v t="leo.20181204193852.1" a="E"><vh>@path paragraph</vh>
<v t="leo.20181204193901.1"><vh>@edit introduction.md</vh></v>
<v t="leo.20181204193941.1"><vh>@edit related_works.md</vh></v>
<v t="leo.20181204194002.1"><vh>@edit conclusion.md</vh></v>
</v>
</v>
</v>
</vnodes>
<tnodes>
<t tx="leo.20181204193631.1"></t>
<t tx="leo.20181204193631.2">QTreeWidget {
    /* These apply to the selected item, but not to editing items.*/
    background-color: #ffffec; /* Leo's traditional tree color */
    selection-color: black; /* was white */
    selection-background-color: lightgrey;
    /* font-family: SansSerif; */
    /*font-family: DejaVu Sans Mono;*/
    font-family:YaHei Mono;
    /* 標題字型大小設定 */
    font-size: 20px;
    font-weight: normal; /* normal,bold,100,..,900 */
    font-style: normal; /* normal, italic,oblique */
 }

/* Headline edit widgets */
QTreeWidget QLineEdit {
    background-color: cornsilk;
    selection-color: white;
    selection-background-color: blue;
    /*font-family: DejaVu Sans Mono;*/    
    font-family:YaHei Mono;
    /* 沒有特別對應字型大小 */
    font-size: 20px;
    font-weight: normal; /* normal,bold,100,..,900 */
    font-style: normal; /* normal, italic,oblique */
}

/* The log panes */
QTextEdit {
    background-color: #f2fdff;
    selection-color: red;
    selection-background-color: blue;
    /* font-family: Courier New; */
    font-family:YaHei Mono;
    /* log font 大小 */
    font-size: 20px;
    font-weight: normal; /* normal,bold,100,..,900 */
    font-style: normal; /* normal, italic,oblique */
}

/* The body pane */
QTextEdit#richTextEdit {
    background-color: #fdf5f5; /* A kind of pink. */
    selection-color: white;
    selection-background-color: red;
    /*font-family: DejaVu Sans Mono;*/
    /* font-family: Courier New; */
    font-family:YaHei Mono;
    /* 內文字型大小 */
    font-size: 20px;
    font-weight: normal; /* normal,bold,100,..,900 */
    font-style: normal; /* normal,italic,oblique */
}

QLabel {
    font-family:YaHei Mono;'CherryPy', 'pytz', 'mako', 'beautifulsoup4', 'pymysql', 'peewee'
    /* 下方的 Minibuffer 標題字型大小 */
    font-size: 20px;
    font-weight: normal; /* normal,bold,100,..,900 */
    font-style: normal; /* normal,italic,oblique */
}

/* Editor labels */
QLineEdit#editorLabel {
    background-color: #ffffec;
    font-family:YaHei Mono;
    /* 沒有直接對應字型大小 */
    font-size: 20px;
    font-weight: normal; /* normal,bold,100,..,900 */
    font-style: normal; /* normal,italic,oblique */
    border: 2px;
    margin: 2px;
}</t>
<t tx="leo.20181204193631.3">horizontal: body pane to the left
vertical: body pane on the botton</t>
<t tx="leo.20181204193804.1"></t>
<t tx="leo.20181204193852.1"></t>
<t tx="leo.20181204194033.1"></t>
<t tx="leo.20181204194651.1"></t>
<t tx="leo.20181204195026.1">@language python
filename = "report"
import os, platform
import chapters
os.chdir("./../markdown")

language = "en"

if platform.system().lower()=="linux": font = "ukai.ttc"
elif platform.system().lower()=="windows": font = "SimSun"
else: font = "Arial"
fontsize = "12"
margin = "1in"

settingFlag = " --pdf-engine=xelatex --mathjax -V lang=zh-cmn -N --toc --highlight-style kate -V documentclass=report  --filter pandoc-fignos --filter pandoc-tablenos --filter pandoc-eqnos --template=template_{}.tex -V \"CJKmainfont:{}\" -V fontsize={}pt -V geometry:margin={} --bibliography=refer.bib --csl=ieee.csl".format(language, font, fontsize, margin)

print("---Pandoc---")

# get chapter sequence
chapter_list = ""
for i in chapters.sequence():
    chapter_list += "./paragraph/" + i + " "
    
g.es(chapter_list)

#os.system("pandoc cover_and_abstract.md " + chapter_list + " reference.md -o ../pdf/report.pdf {}".format(settingFlag))
g.es("pandoc cover_and_abstract.md " + chapter_list + " reference.md -o ../pdf/report.pdf {}".format(settingFlag))
g.es("PDF 轉換完畢")
print('-'*12)</t>
</tnodes>
</leo_file>
