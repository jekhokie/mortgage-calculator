require 'sinatra'

class MortgageCalc < Sinatra::Base
  # primary route - most interaction is client-side based as JavaScript functions
  get '/', provides: [ 'html' ] do
    erb :index
  end
end
