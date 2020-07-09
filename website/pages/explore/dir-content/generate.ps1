$lines = Get-Content input.txt

foreach($line in $lines)
{
    $title = $line.ToUpper();
    $directory = $line;
    $filename = $line.ToLower().Replace(" ","-").Replace("/","-").Replace("\","-").Replace(".","") + ".asciidoc";

    $content = "= $title

[.directory]
== $directory

[.links-to-files]
== Related

[.common-links]
=== Links

[.devon4j-links]
=== devon4j Links

[.devon4net-links]
=== devon4net Links

[.devon4ng-links]
=== devon4ng Links

[.devon4node-links]
=== devon4node Links

[.videos-links]
=== Video Links
";

    if(-not (Test-Path $filename))
    {
        $filename
        Set-Content -Path $filename -Value $content;
    }
}