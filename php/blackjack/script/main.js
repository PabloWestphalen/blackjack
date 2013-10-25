      // regra 6: in case of sudden game stop, he who has the higher score, but does not blow up, wins
      // regra 8: The dealer has to take hits until his or her cards total 17 or more points.
      // regra 10: The dealer never doubles, splits, or surrenders
      // regra stand: take one more card, then no more
      // double: double the bet, take one more card, then stand
      // actions: On their turn, players must choose whether to "hit" (take a card), "stand"
      //   (end their turn), "double" (double wager, take a single card and finish)




  // Global Variables
  var nipes = ["hearts", "clubs", "diamond", "spades"];
  var deck = new Array();
  var objs;
  var elements;
  var cardDraw;
  var cash = 1000;
  var bet = 0;
  var human = {
      "score": 0,
      "hand": new Array(),
      "isStanding": false
  };
  var dealer = {
      "score": 0,
      "hand": new Array(),
      "isStanding": false
  };

  function shuffle(o) {
      for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
  }

  function rand(limit) {
      return Math.round(Math.random() * limit); // limit of 1 for boolean
  }

  function buildDeck() {
      for (i in nipes) {
          for (j = 0; j <= 12; j++) {
              var num;
              var value;
              switch (j) {
                  case 0:
                      value = "A";
                      num = 1;
                      break;
                  case 10:
                      value = "J";
                      num = 10;
                      break;
                  case 11:
                      value = "Q";
                      num = 10;
                      break;
                  case 12:
                      value = "K";
                      num = 10;
                      break;
                  default:
                      value = (j + 1);
                      num = (j + 1);
              }
              var card = {
                  "nipe": nipes[i],
                      "value": value,
                      "number": num
              }
              deck.push(card);
          }
      }
  }

  function draw(_player, hidden) {
      var c = deck.pop();
      if (hidden) {
          card = '<div class="card ' + c.nipe + ' hidden-card" style="position: relative; left: 3000px;">';
      } else {
          card = '<div class="card ' + c.nipe + '" style="position: relative; left: 3000px;">';
      }
      card += '<span class="r-top\">&' + c.nipe + ';</span>';
      card += '<span class="card-body">' + c.value + '</span>';
      card += '<span class="l-bottom">&' + c.nipe + ';</span>';
      card += '</div>';
      card = $(card);
      $("." + _player + ">.hand").append(card);
      cardDraw++;
      return {
          "elem": card,
              "card": c
      };
  }

  function drawCards(drawNext) {
      plCard = draw("human");
      if (dealer.hand.length == 1) {
          dlCard = draw("dealer", true);
      } else {
          dlCard = draw("dealer");
      }
      human.score += plCard.card.number;
      dealer.score += dlCard.card.number;
      human.hand.push(plCard.card);
      dealer.hand.push(dlCard.card);
      $(function () {
          dlCard.elem.animate({
              left: 0
          }, {
              complete: function () {
                  plCard.elem.animate({
                      left: 0
                  }, {
                      complete: function () {
                          if (drawNext) {
                              drawCards(false);
                          } else {
                              if (dealer.hand.length == 2) {
                                  $("#dl-score").text("(" + dealer.hand[0].number + "+)");
                              } else {
                                  $("#dl-score").text("(" + dealer.score + ")");
                              }
                              $("#pl-score").text("(" + human.score + ")");
                              if (dealer.hand.length > 2) {
                                  $(".hidden-card").removeClass("hidden-card")
                              }
                              result = checkWinners();
                              if (cardDraw > 2) {
                                  $("#btn-surrender").attr("disabled", "disabled");
                              }
                              pay(result);
                          }

                      }
                  });
              }
          });

      });


  }

  function pay(result) {
      if (result == "dealer-busts") {
          cash += bet;
          msg("You won $" + bet + "!");
      } else if (result == "player-busts") {
          cash -= bet;
          msg("You lost $" + bet + " :(");
      } else if (result == "human-special" || result == "human-blackjack") {
          cash += (bet * 1.5);
          msg("You won $" + (bet * 1.5) + " with a blackjack!");
      } else if (result == "dealer-special" || result == "dealer-blackjack") {
          cash -= (bet * 1.5);
          msg("Oh noes, you lost $" + (bet * 1.5) + " :(");
      } else if (result == "both-bust") {
          alert("Haha, you both busted");
      } else if (result == "surrender") {
          msg("You lost $" + (bet / 2) + " for surrendering. Best luck next time, pal.");
          cash -= (bet / 2);
      } else {
          return;
      }
      resetGame();
  }

  function resetGame() {
      $("#cash").text(cash);

      bet = 0;
      $("#bet-text").text("");
      $(".bet-controls").show();
      $("#game-buttons").toggleClass("not-visible");
      $(".card").remove();
      $(".player").css("visibility", "hidden");
      $(".player").css("max-height", "0");
      human = {
          "score": 0,
              "hand": new Array()
      };
      dealer = {
          "score": 0,
              "hand": new Array()
      };
      $("#dl-score").text("");
      $("#pl-score").text("");
      $("#bet").val((cash * 0.1));
      $("#bet").focus();
      cardDraw = 0;
      $("#btn-surrender").removeAttr("disabled");

  }

  function checkWinners() {



      if (human.score > 21 && dealer.score > 21) {
          return "both-bust"; //no one wins 
      }

      if (hasSpecialBlackjack(human.hand) && !hasSpecialBlackjack(dealer.hand)) {
          $("#pl-score").text("(21)");
          return "human-special";
      }

      if (hasSpecialBlackjack(dealer.hand) && !hasSpecialBlackjack(human.hand)) {
          $("#dl-score").text("(21)");
          return "dealer-special";
      }

      if (human.score == 21 && dealer.score != 21) {
          return "human-blackjack";
      }

      if (dealer.score == 21 && human.score != 21) {
          return "dealer-blackjack";
      }

      if (dealer.score > 21 && human.score < 21) {
          return "dealer-busts";
      }

      if (human.score > 21 && dealer.score < 21) {
          return "player-busts";
      }

      return "none";
  }

  function hasSpecialBlackjack(hand) {
      if (hand.length == 2) {
          if (hand[0].value === "A" && hand[1].number === 10) {
              return true;
          }
          if (hand[1].value === "A" && hand[0].number === 10) {
              return true;
          }
      }
      return false;
  }

  function validateBet() {
      var _bet = parseFloat($("#bet").val());
      if (_bet > 0 && _bet >= (cash * 0.1)) {
          bet = _bet;
          return true;
      } else {
          msg("Your bet must be a number between " + (cash * 0.1) + " and " + cash);
          return false;
      }
  }

  function msg(string) {
      $(".hidden-card").removeClass("hidden-card")
      alert(string);
  }


  $(document).ready(function () {
      buildDeck();
      shuffle(deck);
      $("#cash").text(cash);

      $("#btn-start").on("click", function () {
          if (validateBet()) {
              $(".player").css("visibility", "visible");
              $(".player").css("max-height", "500px");
              $(".bet-controls").hide();
              $("#bet-text").text("$" + bet);
              $("#game-buttons").toggleClass("not-visible")
              drawCards(true);
              cardDraw = 0;
          }
      });


      $("#btn-hit").on("click", function () {
          drawCards();
      });

      $("#btn-surrender").on("click", function () {
          pay("surrender");
      });


  });
































































  /*  // regra 1: dealer estoura, player não -> player regular win
    // regra 2: player estoura, dealer não -> dealer win
    // regra 3: player faz blackjack, dealer não -> player special win
    // regra 4: dealer faz blackjack, player não -> dealer special win
    // regra 5: se ambos estourarem, ninguém ganha

    // regra 7: A's are worth 11 if the other card is a 10, otherwise they are worth 1

    // regra 9: Dealer's second card is hidden

    // regra 11: a blackjack beats any hand that is not a blackjack (even one with a value of 21)
   // regra 12: payment ->  Wins are paid out at 1:1, or equal to the wager, except for winning
      //   blackjacks, which are traditionally paid at 3:2 (meaning the player receives three dollars
      //  for every two bet)
      // surrender: only available as a first action. quits the hand, receiving 50% of what was bet

      // 2 cards are drawn when the game begins





*/


