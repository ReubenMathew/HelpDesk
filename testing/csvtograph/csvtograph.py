import csv
import os
import pandas as pd
import numpy as np

print("csvtograph called")
  
#For Every File That is a CSV in the Given Folder Perform Function
fol_path = os.path.dirname(__file__)
csvs = [os.path.join(fol_path,file) for file in os.listdir(fol_path) if ".csv" in file]
print(csvs)
for item in csvs:
   df_rows = []
   df_header = []
   headers = []
   rows = []
   print(item)
   file = open(item)
   #File is  _io.TextIOWrapper
   csvreader = csv.reader(file)
   headers = next(csvreader)
   df_header = [headers[0], headers[2], headers[16]]
   #print(headers)
   csvreader = [row for row in csvreader if len(row)>17]
   for row in csvreader:
       if float(row[2])!=0.0:
          df_rows.append([row[0], row[2], row[16]])
       else:
          pass
   file.close()
   rows = [] #Free memory from rows
   csvreader = [] #Free memory csvreader

   # Result header [metric_name, metric_value, url]
   #print(df_rows)
   #Filter Responses By Url
   column_names = set([item[-1] for item in df_rows ])
   layers = []
   #print(column_names)
   for name in column_names:
       print(name)
       #Create The Respective Numpy DataFrame and Compute the Average
       un_averaged_data = [item[:2] for item in df_rows if item[-1]==name]
       un_averaged_data.sort(key=lambda x: str(x[0]))
       rw = set([item[0] for item in un_averaged_data])
       tlist = []
       print(rw)
       for rw_name in rw:
            temp_results = filter(lambda x: x[0] == rw_name, un_averaged_data)
            temp_results = [float(tr[1]) for tr in temp_results]
            #print(temp_results[:4])
            avg_rw = np.mean(temp_results)
            rw_tup = (rw_name,avg_rw)
            tlist.append(rw_tup)
       if name !='':
           layers.append([name,tlist])
       #for tup in tlist:
       #    print(str(tup[0]) + " : " + str(tup[-1]))
       print("\n")
   data = []
   column_names.remove('')
   for layer in layers:
       #print(layer[-1])
       layer = layer[-1]
       l2 = [it[1] for it in layer]
       print(data)
       data.append(l2)

   try:
      df = pd.DataFrame(data, columns=rw, index=column_names)
      df.to_csv((str(item.split('.')[0])+"good"+'.csv'), encoding='utf-8')
   except:
      pass
       
       
