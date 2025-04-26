from website import create_app

app = create_app()

# Add this to help debug on PythonAnywhere
print("Main.py loaded - app object created")

if __name__ == "__main__":
    app.run(port=5000, debug=True)
