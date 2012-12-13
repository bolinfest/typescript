module {

    class Helper {

    }

}


module {
    
    // Should be an error
    class Helper {

    }

}

module Foo {

    class Helper {

    }

}


module Foo {
    
    // Should not be an error
    class Helper {

    }

}

module Gar {
    module Foo {

        class Helper {

        }

    }


    module Foo {
    
        // Should not be an error
        class Helper {

        }

    }
}
