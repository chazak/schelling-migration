// minimal-test.js - Minimal test without complex imports
console.log("Minimal test script loaded");

// Test class without imports
class SimpleTest {
    constructor() {
        this.message = "Simple test working";
    }
    
    test() {
        return this.message;
    }
}

// Test export
export { SimpleTest };