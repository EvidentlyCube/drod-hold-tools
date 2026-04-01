# Things to keep in mind:
1. This tool should support all versions of DROD holds.
2. DROD marks newlines with (\r) while HTML requires (\r\n). Conversion should
   happen when reading/writing the hold so that all data structures always have
   HTML compatible format.

# Caveats regarding supporting all hold files
At a point in the past this tool was tested against all the published holds
(official and user made) as well as all the holds in the architecture board.
Testing involved loading it into the tool and making sure it passes the sanity
check - exporting the hold without changes produces identical XML structure.
Almost all holds have passed this test with an exception of a few on the
architecture board.