# lost_found.py
# Simple Lost and Found System (Demo for Jenkins)

lost_items = []
found_items = []

def report_lost(item, name):
    lost_items.append({"item": item, "owner": name})
    print(f"{item} reported lost by {name}")

def report_found(item, finder):
    found_items.append({"item": item, "finder": finder})
    print(f"{item} reported found by {finder}")

def match_items():
    print("\nChecking for matches...\n")
    for lost in lost_items:
        for found in found_items:
            if lost["item"].lower() == found["item"].lower():
                print(f"Match Found!")
                print(f"Item: {lost['item']}")
                print(f"Owner: {lost['owner']}")
                print(f"Found by: {found['finder']}\n")

def main():
    print("---- Lost and Found System ----")

    report_lost("Wallet", "Pariksha")
    report_lost("Phone", "Rahul")

    report_found("Wallet", "Amit")
    report_found("Keys", "Neha")

    match_items()

if __name__ == "__main__":
    main()