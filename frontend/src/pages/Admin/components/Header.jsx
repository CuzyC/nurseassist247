function Header ({pageTitle}) {
    return (
        <header className="h-12 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <h1 className="text-gray-900">{pageTitle}</h1>
            </div>
        </header>
    );
}

export default Header;