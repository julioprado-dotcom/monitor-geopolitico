import re

with open('/home/z/my-project/src/data/signals.ts', 'r') as f:
    content = f.read()

# Find all fullContent that start with " and contain newlines, replace with template literals
# Pattern: fullContent: "...(multiline)..."
def replace_fullcontent(match):
    prefix = match.group(1)  # "fullContent: "
    quote_start = match.group(2)  # The opening "
    text = match.group(3)  # The content
    quote_end = match.group(4)  # The closing "
    return f"{prefix}`{text}`"

# Match fullContent: "..." where ... contains newlines
# We need to be careful with nested quotes in the text
count = 0
# Find fullContent patterns - handle both multiline and single-line
pattern = r'(fullContent:) "((?:[^"\\]|\\.)*)"'
matches = list(re.finditer(pattern, content, re.DOTALL))

for match in reversed(matches):
    old_text = match.group(0)
    text_content = match.group(2)
    # Check if it contains newlines
    if '\n' in text_content:
        new_text = f'fullContent: `{text_content}`'
        content = content[:match.start()] + new_text + content[match.end():]
        count += 1

print(f"Fixed {count} multiline fullContent entries to use template literals")

# Also check for remaining fullContent: "" (empty)
empty_count = len(re.findall(r'fullContent: ""', content))
print(f"Remaining empty fullContent: {empty_count}")

with open('/home/z/my-project/src/data/signals.ts', 'w') as f:
    f.write(content)

print("File saved")
