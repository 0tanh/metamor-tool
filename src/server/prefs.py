import json 

icons =  ["must", "like", "maybe", "prefer-not", "off-limit", "talk"]

with open("relationship_prefs_json.json", encoding="utf8") as og:
    raw = json.load(og)

all_options = raw["preferences"]

class Option():
    def __init__(self, name: str, icon: str, note: str=""):
        self.name = name
        self.icon = icon
        self.note = note
        
    def clear_option(self):
        self.icon = ""
    def clear_note(self):
        self.note = ""
    def set_option(self, option: str):
        self.icon = option  
    def add_note(self, note: str):
        self.note = note
    def new(self, option):
        return Option(**option)
    def __repr__(self) -> str:
        return f"name={self.name}, icon={self.icon}, note={self.note}"

formatted= []
for o in all_options:
    formatted.append(Option(**o))

print(formatted)

for o in formatted:
    o.clear_option()
    o.clear_note()

emptied = {}
emptied["name"] = ""
emptied["date"] = ""
emptied["prefs"] = formatted


print(emptied)

with open("empty_metamor.json", "w+", encoding="utf8") as empty:
    json.dump(emptied, empty, default=lambda o: o.__dict__, indent=4)
