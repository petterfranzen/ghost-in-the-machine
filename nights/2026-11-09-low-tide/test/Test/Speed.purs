module Test.Speed (clockNow) where

import Effect (Effect)

foreign import clockNow :: Effect Number
