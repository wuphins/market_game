#!/usr/bin/python

import sys
import json
import cgi
import datetime

fs = cgi.FieldStorage()

d = {}
for k in fs.keys():
    d[k] = fs.getvalue(k)

now = datetime.datetime.now()
ID = now.strftime("%m%d%Y%H%M%S%f")

with open('output/'+ID+'.json','w') as f:
	f.write(json.dumps(d,indent=1))
	f.close()


sys.stdout.write("Content-Type: application/json")
sys.stdout.write("\n")
sys.stdout.write("\n")
sys.stdout.write(json.dumps(d,indent=1))
sys.stdout.write("\n")

sys.stdout.close()
