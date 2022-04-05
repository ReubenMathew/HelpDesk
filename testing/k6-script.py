import time
import re
import os
urls = ["https://rosy-meal-production.up.railway.app", "https://helpdesk-backend.fly.dev"]
routes = ["/enqueue","/login","/"] # First  Item

script_base ="""import http from 'k6/http';
import { sleep } from 'k6';
"""

script_const= """export const options = {
  stages: [
    { duration: '2m', target: 50 }, // below normal load
    { duration: '5m', target: 50 },
    { duration: '2m', target: 100 }, // normal load
    { duration: '5m', target: 150 },
    { duration: '2m', target: 150 }, // around the breaking point
    { duration: '5m', target: 150 },
    { duration: '2m', target: 150 }, // beyond the breaking point
    { duration: '5m', target: 200 },
    { duration: '10m', target: 0 }, // scale down. Recovery stage.
  ],
};"""

script_const_sk= """
export const options = {
  stages: [
    { duration: '2m', target: 50 }, 
    { duration: '2h', target: 200 }, 
    { duration: '2m', target: 0 }, 
  ],
};
"""

scripts_const_params= """
const body = {
  'username': 'admin1',
  'password': 'password'
};
"""

def genDfunk(url, routes):
   script_defunc= """
export default function () {
  const BASE_URL = '"""+str(url)+"""'; 
  const responses = http.batch([
    ['POST', `${BASE_URL}"""+str(routes[0])+"""`, null, { tags: { name: 'HelpDesk' } }],
    ['POST', `${BASE_URL}"""+str(routes[1])+"""`, body, { tags: { name: 'HelpDesk' } }],
    ['GET', `${BASE_URL}"""+str(routes[-1])+"""`, null, { tags: { name: 'HelpDesk' } }],
  ]);
  sleep(1);
}"""
   return script_defunc


global items
items = []
def generateTests(urls, routes,soak):
    nicknames = ["railway","fly"][::-1]
    for url in urls:
        if soak:
            flname = nicknames.pop()+"-soak.js"
            items.append(flname)
            ftext = script_base + "\n"+scripts_const_params+ "\n"+script_const_sk + "\n" + genDfunk(url, routes)
        else:
            flname = nicknames.pop()+"-stress.js"
            items.append(flname)
            ftext = script_base + "\n"+scripts_const_params+ "\n"+script_const + "\n" + genDfunk(url, routes)
        with open(flname,'w') as sc:
            sc.write(ftext)
            print("Wrote To Files")




generateTests(urls,routes,True) # Soak
generateTests(urls,routes, False) # Stress
time.sleep(2)
s_command=""
while len(items)>0:
    #print(items)
    #print(len(items))
    l_item = items.pop()
    subbed = re.sub('[^a-zA-Z0-9 \n\.]', '',l_item).replace(".","")
    os.system("k6 run "+l_item+" --out csv=csvtograph/"+subbed+".csv")
from csvtograph import csvtograph
