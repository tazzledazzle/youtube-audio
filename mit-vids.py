import os

str = ""
with open("nigthBuild.txt", 'r') as f:
    str = f.read()
    str = str.split('\n')
# print str
    # figure out filtering method
# os.system("mkdir ")
dir = "test"
for s in str:
    if "https://" in s:
        print "Youtube Video " +  s
        os.system("youtube-dl --extract-audio --output '"+dir+"/%(title)s.%(ext)s' --audio-format mp3 " + s)
    else:
        print s
        s = s.replace(" ", "-")
        os.system("mkdir "+ s)
        dir = s
    pass