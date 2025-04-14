import React from 'react';
import { registerRootComponent } from 'expo';
import RootLayout from './_layout';

function App() {
    return <RootLayout />;
}

registerRootComponent(App);

export default App;